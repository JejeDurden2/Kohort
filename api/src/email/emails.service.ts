import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bull'
import { Resend } from 'resend'

import { QueueName } from '../common/enums/queue-names.enum'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { SendEmailDto } from './dto/send-email.dto'

@Injectable()
export class EmailsService {
  private resend: Resend
  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: DefaultScopedLoggerService,
    @InjectQueue(QueueName.EMAIL) private emailQueue: Queue
  ) {
    this.resend = new Resend(
      this.configService.get<string>('RESEND_API_KEY', '')
    )
  }

  async enqueue(sendEmailDto: SendEmailDto) {
    await this.emailQueue.add(QueueName.EMAIL, sendEmailDto)
  }

  async send(sendEmailDto: SendEmailDto) {
    const from = `${sendEmailDto.fromName ? sendEmailDto.fromName : this.configService.get<string>('RESEND_FROM_NAME', '')} <${this.configService.get<string>(sendEmailDto.fromEmail ? sendEmailDto.fromEmail : 'RESEND_FROM_EMAIL', 'noreply@kohortpay.com')}>`

    const compiledHtml = this.compileTemplate(
      sendEmailDto.html,
      sendEmailDto.dynamicTemplateData
    )

    const compiledSubject = this.compileTemplate(
      sendEmailDto.subject,
      sendEmailDto.dynamicTemplateData
    )
    const mailData = {
      from,
      to: Array.isArray(sendEmailDto.to) ? sendEmailDto.to : [sendEmailDto.to],
      subject: compiledSubject,
      html: compiledHtml,
      bcc: sendEmailDto.bcc
        ? Array.isArray(sendEmailDto.bcc)
          ? sendEmailDto.bcc
          : [sendEmailDto.bcc]
        : undefined,
      cc: sendEmailDto.cc
        ? Array.isArray(sendEmailDto.cc)
          ? sendEmailDto.cc
          : [sendEmailDto.cc]
        : undefined,
      reply_to: sendEmailDto.reply_to
        ? Array.isArray(sendEmailDto.reply_to)
          ? sendEmailDto.reply_to
          : [sendEmailDto.reply_to]
        : undefined,
      attachments: sendEmailDto.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        content_type: att.content_type,
        path: att.path,
      })),
      scheduled_at: sendEmailDto?.scheduled_at,
    }

    this.loggerService.log(
      `Sending email with subject "${sendEmailDto.subject}" to ${mailData.to}`,
      { mailData }
    )

    try {
      const response = await this.resend.emails.send(mailData)

      this.loggerService.log(
        `Email with subject "${sendEmailDto.subject}" successfully sent to ${mailData.to}`,
        { mailData, response }
      )
      return response
    } catch (error) {
      this.loggerService.error(
        `Failed to send email with subject "${sendEmailDto.subject}" to ${mailData.to}`,
        error.stack,
        { mailData }
      )
      throw error
    }
  }

  private compileTemplate(
    template: string,
    data: Record<string, unknown> = {}
  ): string {
    // Handle {{#equals ...}} and {{/equals}}
    const equalsRegex = /{{#equals (.*?) "(.*?)"}}([\s\S]*?){{\/equals}}/g

    template = template.replace(equalsRegex, (_, variable, value, content) => {
      const variableValue = this.resolveDataPath(data, variable.trim())
      return String(variableValue) === value ? content : ''
    })

    // Handle conditional logic with {{#if ...}} and {{else}}
    const ifElseRegex = /{{#if (.*?)}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g

    template = template.replace(
      ifElseRegex,
      (_, condition, ifTrue, ifFalse) => {
        const value = this.resolveDataPath(data, condition.trim())
        return this.isTruthy(value) ? ifTrue : ifFalse
      }
    )

    // Handle simple {{#if ...}} without {{else}}
    const ifRegex = /{{#if (.*?)}}([\s\S]*?){{\/if}}/g

    template = template.replace(ifRegex, (_, condition, ifTrue) => {
      const value = this.resolveDataPath(data, condition.trim())
      return this.isTruthy(value) ? ifTrue : ''
    })

    // Replace all remaining {{key}} placeholders
    template = template.replace(/{{(.*?)}}/g, (_, key) => {
      const value = this.resolveDataPath(data, key.trim())
      return value !== undefined ? String(value) : ''
    })

    return template
  }

  private resolveDataPath(
    data: Record<string, unknown>,
    path: string
  ): unknown {
    // Traverse the data object based on the dot-separated path
    return path
      .split('.')
      .reduce(
        (acc, part) =>
          acc && typeof acc === 'object' && part in acc ? acc[part] : undefined,
        data
      )
  }

  private isTruthy(value: unknown): boolean {
    // Determine if a value should be considered "truthy" for the purposes of template logic
    if (Array.isArray(value)) {
      return value.length > 0
    }
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).length > 0
    }
    return Boolean(value)
  }
}

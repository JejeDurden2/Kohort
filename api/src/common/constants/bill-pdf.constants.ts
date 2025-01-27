import * as path from 'path'

export const PAGE_MARGINS = {
  LEFT: 40,
  TOP: 40,
}

export const FONT_SIZES = {
  REGULAR: 8,
  BOLD: 14,
  HEADER: 16,
  TITLE: 12,
  TRANSACTION_HEADER: 10,
}

export const COLORS = {
  GREY: '#737373',
  GREY_LIGHT: '#D9D9D9',
}

export const LINE_SPACING = 25
export const LINE_HEIGHT = 0.5

export const PATHS = {
  STAMP_IMAGE: path.join(process.cwd(), 'public/images/stamp.png'),
  LOGO_IMAGE: path.join(process.cwd(), 'public/images/logo-kohortpay.png'),
  FONT_REGULAR: path.join(
    process.cwd(),
    'public/fonts/Poppins/Poppins-Regular.ttf'
  ),
  FONT_BOLD: path.join(process.cwd(), 'public/fonts/Poppins/Poppins-Bold.ttf'),
}
export const KOHORTPAY_ADDRESS = {
  name: 'KohortPay',
  address: '61 Boulevard des Dames',
  city: '13002 Marseille',
  siren: '987261763',
  vatNumber: 'FR23920650025',
}
export const OUTPUT_FILENAME = 'invoice.pdf'

export const VAT_PERCENTAGE = 20
export const VAT_RATE = VAT_PERCENTAGE / 100

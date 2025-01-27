'use client'

import { useAuth } from '@clerk/nextjs'
import axios from 'axios'

export const CallAPI = async (path: string) => {
  const { getToken } = useAuth()
  const token = await getToken()
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_KOHORT_API_URL}` + path,
    config
  )
  return {
    result: res.data,
  }
}

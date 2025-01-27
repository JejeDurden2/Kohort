'use client'

import useSWR from 'swr'

import { requestApi } from '@api/server'

export default function useApi(path: string | null) {
  const { data, error, isLoading } = useSWR(path, (path) =>
    requestApi('get', path)
  )

  return {
    data,
    isLoading,
    error,
  }
}

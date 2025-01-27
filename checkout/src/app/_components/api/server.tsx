'use server'

import axios from 'axios'

export async function requestApi(
  method: 'get' | 'post' | 'delete' | 'patch',
  path: string,
  data?: any
) {
  const config = {
    method: method,
    url: process.env.KOHORTPAY_API_URL + path,
    data: data,
    auth: {
      username: process.env.KOHORTPAY_MASTER_KEY || '',
      password: '',
    },
  }

  try {
    const res = await axios.request(config)
    return res.data
  } catch (error: any) {
    // If the error came from the API, display it
    if (error.response.data) {
      console.log('API-ERROR', error.response.data)
      return error.response.data
    }

    // If no response from API, throw the axios error message
    console.log('API-ERROR', error.message)
    throw new Error(error.message)
  }
}

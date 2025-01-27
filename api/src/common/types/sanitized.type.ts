import { OMITTED_FIELDS } from '../constants/miscellaneous.constants'

// A utility type that takes a generic type T and returns a type with keys K omitted
export type Sanitized<T> = Omit<T, (typeof OMITTED_FIELDS)[number]>

export type DataObject = {
  DocMovement?: object // {id}
  Entity?: object[] // [{id,Parent},{id,Parent}]
  TableData?: object[] // [{},{}]
}

export type MessageBody = {
  Token?: string
  module?: string
  form?: string
  data?: DataObject
  method?: string
  id?: number | string
}

export type ApiResponse = {
  DocMovement?: object
  Entity?: object[]
  TableData?: object[]
  Error?: string | null
  Message?: string | null
  FrontFunc?: object
  FormProperties?: object
  Token?: string | null
}
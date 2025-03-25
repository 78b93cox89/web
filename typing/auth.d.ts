declare interface SendCodeSuccessResponse {
  status: number
  message: string
  data?: {
    id: string
  }
}

declare interface UserSettings {
  language: string
  theme: string
  r18: boolean
}

declare interface ProfileResponse {
  status: number
  message: string
  data: {
    username: string
    email: string
    telegram_id: string
    settings: UserSettings
  }
}

declare interface UpdateSettingsResponse {
  status: number
  message: string
  data: UserSettings
}

declare interface LoginSuccessResponse {
  code: number
  expire: string
  token: string
}

import dayjs from 'dayjs'
import 'dayjs/locale/vi'

dayjs.locale('vi')

export function formatDateVN(date: string | Date | null | undefined, format = 'DD/MM/YYYY'): string {
  if (!date) return '-'
  const d = dayjs(date)
  return d.isValid() ? d.format(format) : '-'
}

export function formatDateTimeVN(date: string | Date | null | undefined): string {
  return formatDateVN(date, 'DD/MM/YYYY HH:mm')
}

export function isPastDate(date: string | Date): boolean {
  return dayjs(date).isBefore(dayjs(), 'day')
}

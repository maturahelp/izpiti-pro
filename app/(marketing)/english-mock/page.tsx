import { redirect } from 'next/navigation'

export default function EnglishMockIndexPage() {
  redirect('/dashboard/tests?grade=12&section=english&mode=past')
}

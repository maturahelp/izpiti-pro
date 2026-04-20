import { redirect } from 'next/navigation'

export default function EnglishPreviewIndexPage() {
  redirect('/dashboard/tests?grade=12&section=english&mode=past')
}

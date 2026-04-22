import { useParams } from 'react-router-dom'

function HowDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  return (
    <main>
      <h1>{slug}</h1>
    </main>
  )
}

export default HowDetailPage

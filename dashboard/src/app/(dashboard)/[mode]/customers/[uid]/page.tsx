export default function Customer({
  params,
}: {
  params: { uid: string; mode: string }
}) {
  return (
    <main>
      Customer View : {params.uid} and {params.mode}
    </main>
  )
}

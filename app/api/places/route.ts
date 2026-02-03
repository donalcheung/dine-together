import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')
  const address = searchParams.get('address')

  if (!name || !address) {
    return NextResponse.json({})
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  const searchRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      `${name} ${address}`
    )}&inputtype=textquery&fields=place_id&key=${apiKey}`
  )

  const searchData = await searchRes.json()
  const placeId = searchData?.candidates?.[0]?.place_id

  if (!placeId) {
    return NextResponse.json({})
  }

  const detailsRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website,opening_hours,rating,price_level&key=${apiKey}`
  )

  const detailsData = await detailsRes.json()

  return NextResponse.json(detailsData.result)
}

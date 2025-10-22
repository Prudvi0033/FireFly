'use client'
import { Share2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import React from 'react'

const Page = () => {
    const {id} = useParams()

    const handleCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_API_URL}/join/${id}`)
      } catch (error) {
        console.error(error);
      }
    }
  return (
    <div className="min-h-screen text-neutral-400 relative flex justify-center items-start bg-neutral-100 py-10">
      <span className='bg-neutral-800 rounded-full p-2' onClick={handleCopyLink}><Share2/></span>
    </div>
  )
}

export default Page
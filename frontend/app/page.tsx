'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './page.module.css'

interface StoryResponse {
  story_text: string
  audio_base64: string
}

export default function Home() {
  const [childName, setChildName] = useState('')
  const [loading, setLoading] = useState(false)
  const [story, setStory] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioInstanceRef = useRef<HTMLAudioElement | null>(null)

  // Set volume on HTML audio element when it's available
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 1.0 // Set to maximum volume
    }
  }, [audioUrl])

  // Cleanup audio when component unmounts or new audio is generated
  useEffect(() => {
    return () => {
      // Cleanup previous audio instance
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause()
        audioInstanceRef.current = null
      }
      // Cleanup previous blob URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const handleGenerate = async () => {
    if (!childName.trim()) {
      setError('Please enter a child\'s name')
      return
    }

    // Stop and cleanup previous audio
    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause()
      audioInstanceRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
    // Cleanup previous blob URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }

    setLoading(true)
    setError(null)
    setStory(null)
    setAudioUrl(null)

    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ child_name: childName.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate story')
      }

      const data: StoryResponse = await response.json()
      setStory(data.story_text)

      // Convert base64 audio to blob URL
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio_base64), (c) => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      )
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)

      // Auto-play audio with explicit volume control
      const audio = new Audio(url)
      audio.volume = 1.0 // Set to maximum volume (0.0 to 1.0)
      audioInstanceRef.current = audio
      audio.play().catch((err) => {
        console.error('Auto-play failed:', err)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Bedtime Story</h1>
        <p className={styles.subtitle}>
          Create a personalized bedtime story for your child
        </p>

        <div className={styles.form}>
          <input
            type="text"
            placeholder="Enter child's name"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleGenerate()}
            className={styles.input}
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !childName.trim()}
            className={styles.button}
          >
            {loading ? 'Generating...' : 'Generate Story'}
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {audioUrl && (
          <div className={styles.audioPlayer}>
            <audio 
              ref={audioRef}
              controls 
              src={audioUrl} 
              className={styles.audio}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {story && (
          <div className={styles.story}>
            <h2 className={styles.storyTitle}>Your Story</h2>
            <div className={styles.storyText}>
              {story.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}


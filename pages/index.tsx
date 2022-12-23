import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import Upload from '../components/Upload'
import TranscriptText from '../components/TranscriptText'
import Query from '../components/Query'
import { useState } from 'react'
import Scrape from '../components/Scrape'
const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [text, setText] = useState('')
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>

        <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-8 md:px-10 lg:px-32 xl:max-w-3xl">
          <h1 className="font-extrabold text-transparent text-6xl bg-clip-text bg-gradient-to-r from-green-200 to-green-600">Info Insighters
          </h1>
          <p className="px-8 mt-8 mb-12 text-lg">transcripts your podcast and search interesting concepts as sentences!</p>
          {/* <div className="flex flex-wrap justify-center">
            <button className="px-8 py-3 m-2 text-lg font-semibold rounded bg-violet-600 text-gray-50">Get started</button>
            <button className="px-8 py-3 m-2 text-lg border rounded text-gray-900 border-gray-300">Learn more</button>
          </div> */}
        </div>
        {/* <Upload setText={setText} /> */}
        {/* <TranscriptText text={text} /> */}
        <Scrape />
      </main>
      <Query />

    </>
  )
}

'use client'
import { Button } from "antd";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
    <div>
      HomePage
    </div>
    <Link href={'/login'}><Button>Go to Dashboard</Button></Link>
    </>
  );
}

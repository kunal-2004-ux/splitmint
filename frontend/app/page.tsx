"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/container"
import Link from "next/link"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SplitMint</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </motion.div>
          </div>
        </Container>
      </header>

      {/* Hero Section */}
      <section className="py-24 lg:py-32">
        <Container>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <Badge variant="secondary" className="mb-4">
                AI-Powered Expense Management
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mb-6 text-5xl font-bold tracking-tight lg:text-7xl"
            >
              Smart expense splitting{" "}
              <span className="text-primary">with AI</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mb-10 text-lg text-muted-foreground lg:text-xl"
            >
              Track shared expenses, split bills effortlessly, and get AI-powered insights
              into your spending patterns. Built for modern teams and friends.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <Link href="/dashboard">
                <Button size="lg" className="group">
                  Try Demo
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/40 py-24">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
              Everything you need to split expenses
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features wrapped in a clean, intuitive interface
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-border/40 transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI-Powered Insights</CardTitle>
                  <CardDescription>
                    Get intelligent summaries and spending patterns analyzed automatically
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Natural language expense entry and smart participant matching
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full border-border/40 transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Group Management</CardTitle>
                  <CardDescription>
                    Create groups, add participants, and track shared expenses seamlessly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Perfect for roommates, trips, or any shared spending
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full border-border/40 transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Real-time Balances</CardTitle>
                  <CardDescription>
                    See who owes what instantly with automatic balance calculations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Transparent, accurate, and always up-to-date
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <Container>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">SplitMint</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 SplitMint. Built with Next.js and AI.
            </p>
          </div>
        </Container>
      </footer>
    </main>
  )
}

"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Users, TrendingUp, Shield, Zap, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/container"
import Link from "next/link"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.12
    }
  }
}

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      {/* Gradient Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">SplitMint</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" className="shadow-md shadow-primary/20">
                  Dashboard
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </Container>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <Container>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium shadow-sm">
                <Zap className="mr-1.5 h-3.5 w-3.5 inline" />
                AI-Powered Expense Management
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl"
            >
              Smart expense splitting{" "}
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent animate-gradient">
                with AI
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mb-10 text-lg text-muted-foreground sm:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed"
            >
              Track shared expenses, split bills effortlessly, and get AI-powered insights
              into your spending patterns.<span className="text-foreground font-medium"> Built for modern teams and friends.</span>
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <Link href="/dashboard">
                <Button size="lg" className="group h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  Try Demo
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border/50 hover:border-primary/50">
                Learn More
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="mt-16 grid grid-cols-3 gap-8 pt-8 border-t border-border/50"
            >
              <div>
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Expenses Split</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="relative border-t border-border/40 bg-muted/20 py-24">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Everything you need to split expenses
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              Powerful features wrapped in a clean, intuitive interface
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <motion.div variants={fadeInUp}>
              <Card className="group h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
                  <CardDescription className="text-base">
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
              <Card className="group h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 ring-1 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all">
                    <Users className="h-7 w-7 text-blue-500" />
                  </div>
                  <CardTitle className="text-xl">Group Management</CardTitle>
                  <CardDescription className="text-base">
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
              <Card className="group h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 ring-1 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all">
                    <TrendingUp className="h-7 w-7 text-purple-500" />
                  </div>
                  <CardTitle className="text-xl">Real-time Balances</CardTitle>
                  <CardDescription className="text-base">
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
      <footer className="border-t border-border/40 bg-muted/10 py-12">
        <Container>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">SplitMint</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 SplitMint. Built with Next.js and AI.
            </p>
          </div>
        </Container>
      </footer>

      <style jsx global>{`
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgb(128 128 128 / 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(128 128 128 / 0.05) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </main>
  )
}

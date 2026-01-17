"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Sparkles, DollarSign, Users as UsersIcon, TrendingUp } from "lucide-react"
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

export default function Dashboard() {
    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border/40">
                <Container>
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Sparkles className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold">SplitMint</span>
                        </div>

                        <Link href="/">
                            <Button variant="ghost">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </Container>
            </header>

            {/* Dashboard Content */}
            <section className="py-12">
                <Container>
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.div variants={fadeInUp} className="mb-8">
                            <h1 className="mb-2 text-4xl font-bold">Dashboard</h1>
                            <p className="text-lg text-muted-foreground">
                                Manage your groups and track expenses
                            </p>
                        </motion.div>

                        {/* Stats Grid */}
                        <motion.div
                            variants={staggerContainer}
                            className="mb-12 grid gap-6 md:grid-cols-3"
                        >
                            <motion.div variants={fadeInUp}>
                                <Card className="border-border/40">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Total Groups
                                        </CardTitle>
                                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">3</div>
                                        <p className="text-xs text-muted-foreground">
                                            Active expense groups
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div variants={fadeInUp}>
                                <Card className="border-border/40">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Total Expenses
                                        </CardTitle>
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">$1,234</div>
                                        <p className="text-xs text-muted-foreground">
                                            Across all groups
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div variants={fadeInUp}>
                                <Card className="border-border/40">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Your Balance
                                        </CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-primary">+$156</div>
                                        <p className="text-xs text-muted-foreground">
                                            You are owed
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>

                        {/* Groups Section */}
                        <motion.div variants={fadeInUp}>
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Your Groups</h2>
                                <Button>
                                    Create Group
                                </Button>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <Card className="border-border/40 transition-colors hover:border-primary/50">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle>Roommates</CardTitle>
                                                <CardDescription>4 participants</CardDescription>
                                            </div>
                                            <Badge variant="secondary">Active</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Total spent</span>
                                                <span className="font-medium">$856</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Your balance</span>
                                                <span className="font-medium text-primary">+$42</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-border/40 transition-colors hover:border-primary/50">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle>Weekend Trip</CardTitle>
                                                <CardDescription>3 participants</CardDescription>
                                            </div>
                                            <Badge variant="secondary">Active</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Total spent</span>
                                                <span className="font-medium">$324</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Your balance</span>
                                                <span className="font-medium text-primary">+$108</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-border/40 transition-colors hover:border-primary/50">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle>Office Lunch</CardTitle>
                                                <CardDescription>2 participants</CardDescription>
                                            </div>
                                            <Badge variant="secondary">Active</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Total spent</span>
                                                <span className="font-medium">$54</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Your balance</span>
                                                <span className="font-medium text-primary">+$6</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </motion.div>
                </Container>
            </section>
        </main>
    )
}

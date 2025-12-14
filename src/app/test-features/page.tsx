'use client'

import { AutoRead } from '@/components/ui/auto-read'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
    const sampleContent = `
        <h2>Welcome to AIFA</h2>
        <p>This is a test page to demonstrate the new features.</p>
        
        <h3>Key Features</h3>
        <ul>
            <li><strong>50+ Languages:</strong> Speak in any language you want!</li>
            <li><strong>Beautiful Animations:</strong> Smooth transitions and effects</li>
            <li><strong>Clean Content:</strong> Properly formatted with no special characters</li>
            <li><strong>Auto-Read:</strong> Lessons start reading automatically</li>
        </ul>
        
        <h2>How It Works</h2>
        <p>Click the globe icon to select your language. The system will automatically clean the text and speak it beautifully.</p>
        
        <p>All animations are smooth and professional, creating a premium learning experience.</p>
    `

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <Card className="animate-slide-up">
                    <CardHeader>
                        <CardTitle className="text-3xl text-center">
                            🌍 Test New Features
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Auto-Read Component */}
                        <AutoRead
                            text={sampleContent}
                            autoStart={false}
                            className="mb-6"
                        />

                        {/* Sample Content */}
                        <div
                            className="lesson-content prose prose-slate max-w-none"
                            dangerouslySetInnerHTML={{ __html: sampleContent }}
                        />

                        {/* Instructions */}
                        <Card className="bg-blue-50 border-blue-200 animate-fade-in">
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-semibold mb-2">How to Test:</h3>
                                <ol className="list-decimal list-inside space-y-2">
                                    <li>Click the "Read Lesson" button to start</li>
                                    <li>Click the 🌍 Globe icon to see 50+ languages</li>
                                    <li>Try changing the speed (0.7x - 1.5x)</li>
                                    <li>Watch the animations on the content above</li>
                                </ol>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, User, Store } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [countdown, setCountdown] = useState(0)
  const [userType, setUserType] = useState<'customer' | 'merchant'>('customer')
  const router = useRouter()
  
  const { requestOtp, verifyOtp, isLoading, error, clearError } = useAuth()

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted, email:', email)
    clearError()
    
    try {
      const result = await requestOtp(email)
      console.log('OTP request result:', result)
      if (result.type === 'auth/requestOtp/fulfilled') {
        setStep('otp')
        setCountdown(60)
        
        // Start countdown
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch (error) {
      console.error('Error in handleRequestOtp:', error)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    const result = await verifyOtp(email, otp)
    if (result.type === 'auth/verifyOtp/fulfilled') {
      // Redirect based on user type
      if (userType === 'merchant') {
        router.push('/merchant/register')
      } else {
        router.push('/')
      }
    }
  }

  const handleResendOtp = async () => {
    clearError()
    const result = await requestOtp(email)
    if (result.type === 'auth/requestOtp/fulfilled') {
      setCountdown(60)
      
      // Start countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Ethiopia's premier Marketplace platform
          </p>
        </div>

        {/* User Type Selection */}
        {step === 'email' && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Account Type</CardTitle>
              <CardDescription>
                Select the type of account you want to create
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={userType === 'customer' ? 'default' : 'outline'}
                  onClick={() => setUserType('customer')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <User className="h-6 w-6" />
                  <span>Customer</span>
                  <span className="text-xs text-muted-foreground">Shop & Buy</span>
                </Button>
                
                <Button
                  variant={userType === 'merchant' ? 'default' : 'outline'}
                  onClick={() => setUserType('merchant')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Store className="h-6 w-6" />
                  <span>Merchant</span>
                  <span className="text-xs text-muted-foreground">Sell & Manage</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Step */}
        {step === 'email' && (
          <Card>
            <CardHeader>
              <CardTitle>Enter your email address</CardTitle>
              <CardDescription>
                We'll send you a verification code via email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your email address
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <Card>
            <CardHeader>
              <CardTitle>Verify your email address</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="mt-1 text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Check your email for the verification code
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Create Account'
                    )}
                  </Button>

                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Resend code in {countdown}s
                      </p>
                    ) : (
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="text-sm"
                      >
                        Resend verification code
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep('email')}
                      className="text-sm"
                    >
                      Change Email Address
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    </div>
  )
}


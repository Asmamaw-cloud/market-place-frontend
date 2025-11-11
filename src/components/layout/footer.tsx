import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12 mx-auto px-6 sm:px-8 lg:px-14">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-14">
          {/* Company Info - Full width on medium, first column on large */}
          <div className="space-y-4 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.svg"
                alt="MAJET"
                width={22}
                height={32}
                className="h-10 w-44"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Ethiopia's premier Marketplace platform with local payment methods and unit-aware catalog.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Quick Links and Customer Service - Side by side on mobile */}
          <div className="grid grid-cols-2 gap-6 md:contents">
            {/* Quick Links */}
            <div className="space-y-4 md:col-span-1">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/products" className="text-sm text-muted-foreground hover:text-primary">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/merchants" className="text-sm text-muted-foreground hover:text-primary">
                    Merchants
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-4 md:col-span-1">
              <h3 className="text-lg font-semibold">Customer Service</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-sm text-muted-foreground hover:text-primary">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-sm text-muted-foreground hover:text-primary">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-sm text-muted-foreground hover:text-primary">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">+251 900 000 000</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">info@ethiopia-ecommerce.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Addis Ababa, Ethiopia</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 Ethiopia E-commerce. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

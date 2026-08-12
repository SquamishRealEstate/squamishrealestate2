import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <Image
                  src="/images/icon.ico"
                  alt="Home"
                  width={20}
                  height={20}
                />
              </div>
              <span className="font-bold">Squamish Real Estate</span>
            </div>
            <p className="text-sm text-secondary-foreground/80">
              Providing Squamish MLS listings, Sold Prices, Property Data &
              Local Business Information
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Properties</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li>
                <Link
                  href="/properties"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="hover:text-secondary-foreground transition-colors"
                >
                  For Sale
                </Link>
              </li>
              <li>
                <Link
                  href={{
                    pathname: "/properties",
                    query: { status: "Sold" },
                  }}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="hover:text-secondary-foreground transition-colors"
                >
                  Recently Sold
                </Link>
              </li>
              <li>
                <Link
                  href="/neighborhoods"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="hover:text-secondary-foreground transition-colors"
                >
                  Neighborhoods
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li>
                <Link
                  href="/about-us"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="hover:text-secondary-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-use"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="hover:text-secondary-foreground transition-colors"
                >
                  Terms Of Use
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-statement"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="hover:text-secondary-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            {/* <p className="text-sm text-secondary-foreground/80 mb-2">
                123 Main Street<br />
                Squamish, BC V8B 0A1
              </p> */}
            <p className="text-sm text-secondary-foreground/80">
              (604) 849 0500
              <br />
              sean@squamish.realestate
            </p>

            <Link
              href="/contact"
              className="inline-block mt-4 text-sm font-medium text-secondary-foreground/80 hover:underline flex items-center gap-1"
            >
              Visit Contact Page →
            </Link>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-sm text-secondary-foreground/60">
          <p>&copy; Sean Brawely PREC* 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

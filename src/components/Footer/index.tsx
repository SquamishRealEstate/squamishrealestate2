import Link from 'next/link';

export default function Footer() {
    return (
         <footer className="bg-secondary text-secondary-foreground py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <img src="/images/icon.ico" alt="Home"  className="w-5 h-5"/>
                </div>
                <span className="font-bold">Squamish Real Estate</span>
              </div>
              <p className="text-sm text-secondary-foreground/80">
                Providing Squamish MLS listings, Sold Prices, Property Data & Local Business Information
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Properties</h4>
              <ul className="space-y-2 text-sm text-secondary-foreground/80">
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">For Sale</a></li>
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Recently Sold</a></li>
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Neighborhoods</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-secondary-foreground/80">
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">About Us</a></li>
                <li><Link href="/terms-of-use" target='_blank' className="hover:text-secondary-foreground transition-colors">Terms Of Use</Link></li>
                <li><Link href="/privacy-statement" className="hover:text-secondary-foreground transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              {/* <p className="text-sm text-secondary-foreground/80 mb-2">
                123 Main Street<br />
                Squamish, BC V8B 0A1
              </p> */}
              <p className="text-sm text-secondary-foreground/80">
                (604) 849 0500<br />
                sean@squamish.realestate
              </p>
            </div>
          </div>

          <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-sm text-secondary-foreground/60">
            <p>&copy; Sean Brawely PREC* 2024. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
}
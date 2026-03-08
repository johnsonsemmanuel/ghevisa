import re
from pathlib import Path

# The new footer we want to inject
new_footer = """      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        {/* Ghana flag accent strip */}
        <div className="flex h-1 mb-12">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-[#C8962E]" />
          <div className="flex-1 bg-[#006B3F]" />
        </div>

        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/gis-logo.png" alt="Ghana" width={36} height={36} className="opacity-80" />
                <div>
                  <p className="font-bold text-sm">GH-eVISA</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest">Republic of Ghana</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The official electronic visa application portal of the Ghana Immigration Service.
              </p>
            </div>

            {/* Visa Information */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Visa Information</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Visa Types", href: "/#visa-types" },
                  { label: "Visa Requirements", href: "/visa-requirements" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Support</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Contact Support
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={13} className="text-gray-500" />
                  <span className="text-gray-400 text-sm">+233 (0) 302 258 250</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={13} className="text-gray-500" />
                  <span className="text-gray-400 text-sm">evisa@gis.gov.gh</span>
                </li>
              </ul>
            </div>

            {/* Government Links */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Government Links</h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2">
                  <ExternalLink size={12} className="text-gray-500" />
                  <a href="https://gis.gov.gh" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Ghana Immigration Service
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <ExternalLink size={12} className="text-gray-500" />
                  <a href="https://mfa.gov.gh" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Embassy Contacts
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Ghana Immigration Service. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs">
              Powered by the Ministry of the Interior, Republic of Ghana
            </p>
          </div>
        </div>
      </footer>"""

base_dir = Path("/home/emmanuel-johnson-excellent/Documents/evsanew/frontend/app")
targets = ["visa-requirements/page.tsx", "help/page.tsx", "terms/page.tsx", "privacy-policy/page.tsx"]

for t in targets:
    p = base_dir / t
    if not p.exists():
        continue
    content = p.read_text()
    
    # Needs to inject Phone, Mail, ExternalLink into imports if not there
    if "Phone" not in content and "lucide-react" in content:
        content = re.sub(r'import\s+\{([^}]+)\}\s+from\s+"lucide-react";', 
                         lambda m: f'import {{{m.group(1)}, Phone, Mail, ExternalLink}} from "lucide-react";', 
                         content)

    # Replace footer
    # Usually it's between <footer... and </footer>
    footer_pattern = re.compile(r'(\{\/\*\s*Footer\s*\*\/\}\s*)?<footer.*?</footer>', re.DOTALL)
    
    # We might have `      {/* Footer */}` or just `<footer`
    content = footer_pattern.sub(new_footer, content)
    
    # Fix Official Government Notice in help
    if t == "help/page.tsx":
        notice_pattern = re.compile(r'\{\/\*\s*Important Notice\s*\*\/\}.*?<\/section>', re.DOTALL)
        content = notice_pattern.sub('', content)

    p.write_text(content)
    print(f"Updated {t}")


import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="bg-gray-50 dark:bg-gray-800 py-3 px-6" aria-label="Breadcrumb">
      <div className="max-w-screen-xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link href="/">
              <span className="flex items-center text-gray-500 dark:text-gray-400 hover:text-darkText dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brandYellow rounded px-1">
                <Home className="w-4 h-4 mr-1" />
                <span itemProp="name">Home</span>
              </span>
            </Link>
            <meta itemProp="position" content="1" />
            <link itemProp="item" href="https://wildclone.com" />
          </li>
          
          {items.map((item, index) => (
            <li key={item.name} className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-2" />
              {item.current ? (
                <span 
                  className="font-medium text-darkText dark:text-white" 
                  itemProp="name"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link href={item.href || "#"}>
                  <span 
                    className="text-gray-500 dark:text-gray-400 hover:text-darkText dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brandYellow rounded px-1"
                    itemProp="name"
                  >
                    {item.name}
                  </span>
                </Link>
              )}
              <meta itemProp="position" content={String(index + 2)} />
              {item.href && <link itemProp="item" href={`https://wildclone.com${item.href}`} />}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
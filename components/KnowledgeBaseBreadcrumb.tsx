import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface KnowledgeBaseBreadcrumbProps {
  items: BreadcrumbItem[];
}

const KnowledgeBaseBreadcrumb: React.FC<KnowledgeBaseBreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex mb-4 text-sm" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            Home
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            <Link
              href={item.href}
              className={`inline-flex items-center ${
                index === items.length - 1
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={index === items.length - 1 ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default KnowledgeBaseBreadcrumb; 
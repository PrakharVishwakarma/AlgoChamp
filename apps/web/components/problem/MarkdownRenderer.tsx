"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMemo, isValidElement } from "react";
import { CodeBlock } from "./CodeBlock";

interface MarkdownRendererProps {
    description: string;
}

export function MarkdownRenderer({ description }: MarkdownRendererProps) {
    // ✅ Memoize markdown components to prevent re-renders
    const markdownComponents = useMemo(() => ({
        // ✅ Code blocks with syntax highlighting support
        code(props: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
            const { inline, className, children } = props;
            const match = /language-(\w+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');
            
            // For inline code, return a simple code element
            if (inline) {
                return (
                    <code className="px-2 py-1 rounded bg-muted/80 text-primary text-sm font-mono border border-border/50 transition-colors duration-200">
                        {code}
                    </code>
                );
            }
            
            // For code blocks, return CodeBlock wrapped in pre
            return (
                <CodeBlock
                    language={match?.[1] || 'text'}
                    code={code}
                    inline={false}
                />
            );
        },

        // ✅ Pre blocks - return CodeBlock's children directly to avoid <p><div> nesting
        pre(props: React.ComponentPropsWithoutRef<'pre'>) {
            return <div className="not-prose">{props.children}</div>;
        },

        // ✅ Headings with proper hierarchy and styling
        h1(props: React.ComponentPropsWithoutRef<'h1'>) {
            return (
                <h1 className="text-3xl font-bold text-foreground mt-8 mb-4 first:mt-0 pb-2 border-b border-border/50 transition-colors duration-200">
                    {props.children}
                </h1>
            );
        },
        h2(props: React.ComponentPropsWithoutRef<'h2'>) {
            return (
                <h2 className="text-2xl font-semibold text-foreground mt-6 mb-3 pb-1 border-b border-border/30 transition-colors duration-200">
                    {props.children}
                </h2>
            );
        },
        h3(props: React.ComponentPropsWithoutRef<'h3'>) {
            return (
                <h3 className="text-xl font-semibold text-foreground mt-4 mb-2 transition-colors duration-200">
                    {props.children}
                </h3>
            );
        },
        h4(props: React.ComponentPropsWithoutRef<'h4'>) {
            return (
                <h4 className="text-lg font-semibold text-foreground mt-3 mb-2 transition-colors duration-200">
                    {props.children}
                </h4>
            );
        },

        // ✅ Paragraphs with proper spacing
        p(props: React.ComponentPropsWithoutRef<'p'>) {
            // Check if paragraph contains a code block (to avoid <p><div> nesting hydration error)
            // React Markdown sometimes wraps <pre> in <p>, which is invalid HTML
            const { children } = props;
            
            // If the only child is a React element and it's a pre/div, render without <p> wrapper
            if (isValidElement(children) && (children.type === 'pre' || children.type === 'div')) {
                return <>{children}</>;
            }
            
            return (
                <div className="text-foreground leading-relaxed my-3 text-base transition-colors duration-200">
                    {children}
                </div>
            );
        },

        // ✅ Lists with better styling
        ul(props: React.ComponentPropsWithoutRef<'ul'>) {
            return (
                <ul className="list-disc list-inside space-y-2 my-3 text-foreground ml-4 transition-colors duration-200">
                    {props.children}
                </ul>
            );
        },
        ol(props: React.ComponentPropsWithoutRef<'ol'>) {
            return (
                <ol className="list-decimal list-inside space-y-2 my-3 text-foreground ml-4 transition-colors duration-200">
                    {props.children}
                </ol>
            );
        },
        li(props: React.ComponentPropsWithoutRef<'li'>) {
            return (
                <li className="text-foreground leading-relaxed transition-colors duration-200">
                    {props.children}
                </li>
            );
        },

        // ✅ Tables with responsive design
        table(props: React.ComponentPropsWithoutRef<'table'>) {
            return (
                <div className="overflow-x-auto my-4 rounded-lg border border-border/50 transition-colors duration-200">
                    <table className="min-w-full border-collapse">
                        {props.children}
                    </table>
                </div>
            );
        },
        thead(props: React.ComponentPropsWithoutRef<'thead'>) {
            return (
                <thead className="bg-muted/80 transition-colors duration-200">
                    {props.children}
                </thead>
            );
        },
        tbody(props: React.ComponentPropsWithoutRef<'tbody'>) {
            return (
                <tbody className="divide-y divide-border/30 bg-card/50 transition-colors duration-200">
                    {props.children}
                </tbody>
            );
        },
        tr(props: React.ComponentPropsWithoutRef<'tr'>) {
            return (
                <tr className="hover:bg-muted/50 transition-colors duration-200">
                    {props.children}
                </tr>
            );
        },
        th(props: React.ComponentPropsWithoutRef<'th'>) {
            return (
                <th className="px-4 py-3 text-left text-foreground font-semibold text-sm transition-colors duration-200">
                    {props.children}
                </th>
            );
        },
        td(props: React.ComponentPropsWithoutRef<'td'>) {
            return (
                <td className="px-4 py-3 text-foreground text-sm transition-colors duration-200">
                    {props.children}
                </td>
            );
        },

        // ✅ Links with security, styling, and accessibility
        a(props: React.ComponentPropsWithoutRef<'a'>) {
            const href = props.href || '#';
            const isExternal = href.startsWith('http');
            
            return (
                <a 
                    {...props}
                    href={href}
                    className="text-primary hover:text-primary/80 underline decoration-primary/50 hover:decoration-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background rounded px-0.5"
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined} // ✅ Security: Prevent tabnabbing
                    aria-label={isExternal ? `${props.children} (opens in new tab)` : undefined}
                >
                    {props.children}
                </a>
            );
        },

        // ✅ Blockquotes for important notes
        blockquote(props: React.ComponentPropsWithoutRef<'blockquote'>) {
            return (
                <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-primary/10 rounded-r italic text-foreground transition-colors duration-200">
                    {props.children}
                </blockquote>
            );
        },

        // ✅ Horizontal rules
        hr() {
            return (
                <hr className="border-border my-6 transition-colors duration-200" />
            );
        },

        // ✅ Strong/Bold text
        strong(props: React.ComponentPropsWithoutRef<'strong'>) {
            return (
                <strong className="font-bold text-foreground transition-colors duration-200">
                    {props.children}
                </strong>
            );
        },

        // ✅ Emphasis/Italic text
        em(props: React.ComponentPropsWithoutRef<'em'>) {
            return (
                <em className="italic text-foreground transition-colors duration-200">
                    {props.children}
                </em>
            );
        },

        // ✅ Delete/Strikethrough
        del(props: React.ComponentPropsWithoutRef<'del'>) {
            return (
                <del className="line-through text-muted-foreground transition-colors duration-200">
                    {props.children}
                </del>
            );
        },
    }), []);

    return (
        <article className="prose prose-invert prose-slate max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
            >
                {description}
            </ReactMarkdown>
        </article>
    );
}

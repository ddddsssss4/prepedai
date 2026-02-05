import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {

        const variants = {
            default: "bg-primary text-primary-foreground hover:bg-primary/90 backdrop-blur-sm",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-neutral-200/50 dark:border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-xl hover:bg-white/70 dark:hover:bg-white/10 hover:text-accent-foreground",
            secondary: "bg-white/60 dark:bg-white/10 text-secondary-foreground hover:bg-white/80 dark:hover:bg-white/20 backdrop-blur-xl border border-neutral-200/50 dark:border-white/10",
            ghost: "hover:bg-white/50 dark:hover:bg-white/10 hover:text-accent-foreground backdrop-blur-sm",
            link: "text-primary underline-offset-4 hover:underline shadow-none",
        }

        const sizes = {
            default: "h-12 px-6 py-3 text-base",
            sm: "h-10 px-4 text-sm",
            lg: "h-14 px-10 text-lg",
            icon: "h-12 w-12",
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-transparent rounded-lg shadow-md hover:shadow-lg",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

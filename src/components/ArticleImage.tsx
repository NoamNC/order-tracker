import { useState } from "react";
import { cn } from "@/lib/utils";

interface ArticleImageProps {
	src: string;
	alt: string;
	fallback: React.ReactNode;
}

function ArticleImage({ src, alt, fallback }: ArticleImageProps) {
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(true);
	const [imageLoaded, setImageLoaded] = useState(false);

	if (error) {
		return <>{fallback}</>;
	}

	return (
		<div className="relative w-16 h-16">
			<img
				src={src}
				alt={alt}
				width={64}
				height={64}
				className={cn(
					"w-16 h-16 rounded-md object-cover flex-shrink-0 border",
					"transition-opacity duration-300 ease-in-out",
					imageLoaded ? "opacity-100" : "opacity-0",
				)}
				loading="lazy"
				decoding="async"
				onError={() => setError(true)}
				onLoad={() => {
					setImageLoaded(true);
					// Delay matches CSS transition duration (duration-300 = 300ms)
					setTimeout(() => setLoading(false), 300);
				}}
			/>
			{loading && (
				<div
					className={cn(
						"absolute inset-0 bg-muted rounded-md",
						"transition-opacity duration-300 ease-in-out",
						imageLoaded ? "opacity-0" : "opacity-100",
					)}
					aria-hidden="true"
				>
					<div className="w-full h-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded-md" />
				</div>
			)}
		</div>
	);
}

export { ArticleImage };

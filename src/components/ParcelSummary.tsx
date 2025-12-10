import type { Order } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArticleImage } from "./ArticleImage";

interface ParcelSummaryProps {
	order: Order;
}

export function ParcelSummary({ order }: ParcelSummaryProps) {
	const articles = order.delivery_info?.articles ?? [];
	const totalItems = articles.reduce(
		(sum, article) => sum + (article.quantity || 0),
		0,
	);
	const totalValue = articles.reduce(
		(sum, article) => sum + (article.price || 0) * (article.quantity || 0),
		0,
	);

	if (articles.length === 0) {
		return null;
	}

	return (
		<Card className="w-full">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg">Package Contents</CardTitle>
				<div className="text-sm text-muted-foreground text-center sm:text-left">
					{totalItems} {totalItems === 1 ? "item" : "items"}
					{totalValue > 0 && (
						<span className="ml-2">
							• Total: {new Intl.NumberFormat("en-US", {
								style: "currency",
								currency: "USD",
							}).format(totalValue)}
						</span>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{articles.map((article, idx) => {
						const placeholder = (
							<div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0 border">
								<svg
									className="w-8 h-8 text-muted-foreground"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
									/>
								</svg>
							</div>
						);

						const hasProductLink = Boolean(article.productUrl);
						const articleName = article.articleName || "Unnamed Product";
						const articleNo = article.articleNo || "N/A";
						const quantity = article.quantity || 0;

						const imageContent = article.articleImageUrl ? (
							<ArticleImage
								src={article.articleImageUrl}
								alt={articleName}
								fallback={placeholder}
							/>
						) : (
							<div className="w-16 h-16 flex-shrink-0">{placeholder}</div>
						);

						const nameContent = (
							<>
								<h4 className="font-medium text-sm leading-tight truncate">
									{articleName}
								</h4>
								<p className="text-xs text-muted-foreground mt-0.5 font-mono">
									SKU: {articleNo}
								</p>
							</>
						);

						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: synthetic data without stable ids
							<div
								key={idx}
								className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
							>
								{/* Article Image */}
								{hasProductLink ? (
									<a
										href={article.productUrl || undefined}
										target="_blank"
										rel="noopener noreferrer"
										className="flex-shrink-0"
										aria-label={`View ${articleName} product page`}
									>
										{imageContent}
									</a>
								) : (
									imageContent
								)}

								{/* Article Details */}
								<div className="flex-1 min-w-0">
									<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
										<div className="flex-1 min-w-0">
											{hasProductLink ? (
												<a
													href={article.productUrl || undefined}
													target="_blank"
													rel="noopener noreferrer"
													className="block hover:text-primary transition-colors"
												>
													{nameContent}
												</a>
											) : (
												nameContent
											)}
										</div>
										<div className="flex items-center gap-3 flex-shrink-0">
											<div className="text-left sm:text-right">
												{article.price > 0 && (
													<p className="text-sm font-medium">
														{new Intl.NumberFormat("en-US", {
															style: "currency",
															currency: "USD",
														}).format(article.price)}
													</p>
												)}
												<p className="text-xs text-muted-foreground">
													Qty: {quantity}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

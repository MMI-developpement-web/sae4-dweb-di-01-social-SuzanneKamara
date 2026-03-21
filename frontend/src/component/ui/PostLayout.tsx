import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.ts';

const postLayoutVariants = cva('w-full mx-auto rounded-sm p-4', {
	variants: {
		variant: {
			default: 'max-w-[270px] bg-slate-200/85',
			soft: 'max-w-[270px] bg-sky-100',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

interface PostLayoutDataProps {
	userName?: string;
	hashtags?: string;
	content?: string;
	title?: string;
	adminLabel?: string;
	logoutLabel?: string;
}

interface PostLayoutViewProps extends VariantProps<typeof postLayoutVariants> {
	className?: string;
}

interface PostLayoutProps extends PostLayoutDataProps, PostLayoutViewProps {}

export default function PostLayout({
	userName = '@username',
	hashtags = '#post #contenu',
	content =
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas volutpat tellus felis, et porttitor odio sollicitudin et. Proin lacinia nisl et sem posuere, vel faucibus arcu dictum.',
	title = 'Post',
	adminLabel = 'Admin',
	logoutLabel = 'Logout',
	variant,
	className,
}: PostLayoutProps) {
	return (
		<section className={cn(postLayoutVariants({ variant }), className)}>
			<h2 className='mb-3 text-2xl font-medium text-gray-300'>{title}</h2>

			<div className='rounded-sm bg-[linear-gradient(160deg,#b4cfe0_0%,#d0e0ea_100%)] p-4'>
				<div className='mb-3 flex items-center justify-end gap-2'>
					<button type='button' className='text-xs text-pink-600 underline'>
						{adminLabel}
					</button>
					<button
						type='button'
						className='rounded-md bg-pink-500 px-3 py-1 text-xs font-semibold text-white hover:bg-pink-600'
					>
						{logoutLabel}
					</button>
				</div>

				<article className='relative rounded-sm bg-white p-4 shadow-sm'>
					<div className='absolute right-4 top-4'>
						<div className='relative h-10 w-10 rounded-full bg-gray-300'>
							<span className='absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-sm bg-violet-500 text-xs text-white'>
								+
							</span>
						</div>
					</div>

					<p className='mt-1 text-xs text-gray-500'>{userName}</p>
					<p className='mt-3 text-xs text-gray-500'>{hashtags}</p>
					<p className='mt-4 text-xs leading-5 text-gray-700'>{content}</p>

					<div className='mt-5 flex items-center gap-4 text-lg text-gray-700'>
						<button type='button' aria-label='like'>
							<span className='text-orange-500'>♡</span>
						</button>
						<button type='button' aria-label='retweet'>↻</button>
						<button type='button' aria-label='comment'>▤</button>
					</div>
				</article>

				<div className='mx-auto -mt-4 grid max-w-45 grid-cols-3 items-center rounded-xl bg-black/35 px-2 py-1 text-white'>
					<button type='button' aria-label='explore' className='grid place-items-center rounded-lg p-2 text-sm'>
						⌖
					</button>
					<button
						type='button'
						aria-label='create post'
						className='mx-auto grid h-9 w-9 place-items-center rounded-md bg-white text-2xl font-semibold text-black'
					>
						+
					</button>
					<button type='button' aria-label='home' className='grid place-items-center rounded-lg p-2 text-lg'>
						⌂
					</button>
				</div>
			</div>
		</section>
	);
}


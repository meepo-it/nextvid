import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function UserAvatar({
  name,
  image,
  className,
}: {
  name: string | null;
  image: string | null;
  className?: string;
}) {
  const initial = name?.charAt(0).toUpperCase() ?? 'U';
  return (
    <Avatar className={cn('size-8 border cursor-pointer', className)}>
      <AvatarImage alt={name ?? ''} src={image ?? undefined} />
      <AvatarFallback>{initial}</AvatarFallback>
    </Avatar>
  );
}

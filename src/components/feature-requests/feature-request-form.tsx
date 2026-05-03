import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { IconPlus, IconLogin2 } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { Routes } from '@/lib/routes';
import * as m from '@/paraglide/messages.js';

interface FeatureRequestFormProps {
  isLoggedIn: boolean;
  onSubmit: (data: {
    title: string;
    description: string;
    category?: string;
  }) => void;
  isSubmitting?: boolean;
}

export function FeatureRequestForm({
  isLoggedIn,
  onSubmit,
  isSubmitting,
}: FeatureRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3 || description.trim().length < 10) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
    });
    setTitle('');
    setDescription('');
    setOpen(false);
  };

  if (!isLoggedIn) {
    return (
      <Link to={Routes.Login}>
        <Button variant="outline">
          <IconLogin2 className="mr-1 size-4" />
          {m.feature_requests_form_login_required()}
        </Button>
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <IconPlus className="mr-1 size-4" />
            {m.feature_requests_submit_button()}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{m.feature_requests_submit_title()}</DialogTitle>
          <DialogDescription>
            {m.feature_requests_submit_description()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {m.feature_requests_form_title()}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={m.feature_requests_form_title_placeholder()}
              required
              minLength={3}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {m.feature_requests_form_description()}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={m.feature_requests_form_description_placeholder()}
              required
              minLength={10}
              maxLength={1000}
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  {m.feature_requests_form_cancel()}
                </Button>
              }
            />
            <Button type="submit" disabled={isSubmitting}>
              {m.feature_requests_form_submit()}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

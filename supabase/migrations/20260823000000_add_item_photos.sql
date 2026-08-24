alter table items add column image_url text;

insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

create policy "users can upload their own item photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'item-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users can update their own item photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'item-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users can delete their own item photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'item-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "anyone can view item photos"
on storage.objects for select
to public
using (bucket_id = 'item-photos');

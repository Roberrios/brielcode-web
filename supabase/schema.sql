create table if not exists public.admin_users (
    user_id uuid primary key references auth.users (id) on delete cascade,
    created_at timestamptz not null default now()
);

create table if not exists public.site_content (
    id text primary key check (id = 'main'),
    content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
    updated_at timestamptz not null default now()
);

create table if not exists public.services (
    id uuid primary key default gen_random_uuid(),
    title text not null check (length(trim(title)) > 0),
    description text not null default '',
    icon text not null default '✳',
    sort_order integer not null default 0,
    published boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    title text not null check (length(trim(title)) > 0),
    category text not null default 'Proyecto destacado',
    client_name text not null default '',
    project_year integer check (project_year is null or project_year between 2000 and 2100),
    project_role text not null default '',
    description text not null default '',
    challenge text not null default '',
    solution text not null default '',
    results text not null default '',
    tags text[] not null default '{}',
    image_url text,
    image_path text,
    gallery_urls text[] not null default '{}',
    gallery_paths text[] not null default '{}',
    project_url text,
    sort_order integer not null default 0,
    published boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.projects
    add column if not exists category text not null default 'Proyecto destacado',
    add column if not exists client_name text not null default '',
    add column if not exists project_year integer,
    add column if not exists project_role text not null default '',
    add column if not exists challenge text not null default '',
    add column if not exists solution text not null default '',
    add column if not exists results text not null default '',
    add column if not exists gallery_urls text[] not null default '{}',
    add column if not exists gallery_paths text[] not null default '{}';

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.projects'::regclass
          and conname = 'projects_project_year_check'
    ) then
        alter table public.projects
            add constraint projects_project_year_check
            check (project_year is null or project_year between 2000 and 2100);
    end if;
end;
$$;

do $$
begin
    if to_regclass('public.proyectos') is not null
       and exists (
           select 1
           from information_schema.columns
           where table_schema = 'public'
             and table_name = 'proyectos'
             and column_name in ('titulo', 'descripcion', 'tags', 'url_imagen')
           group by table_schema, table_name
           having count(*) = 4
       )
       and not exists (select 1 from public.projects) then
        execute $migration$
            insert into public.projects (title, description, tags, image_url, sort_order)
            select trim(titulo),
                   coalesce(descripcion, ''),
                   coalesce(tags, '{}'::text[]),
                   url_imagen,
                   row_number() over (order by titulo)::integer
            from public.proyectos
            where nullif(trim(titulo), '') is not null
        $migration$;
    end if;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.admin_users
        where user_id = (select auth.uid())
    );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admin_users enable row level security;
alter table public.site_content enable row level security;
alter table public.services enable row level security;
alter table public.projects enable row level security;

drop policy if exists "admins can read their own admin record" on public.admin_users;
create policy "admins can read their own admin record"
    on public.admin_users for select to authenticated
    using (user_id = (select auth.uid()));

drop policy if exists "public can read site content" on public.site_content;
create policy "public can read site content"
    on public.site_content for select to anon, authenticated
    using (true);

drop policy if exists "admins can insert site content" on public.site_content;
create policy "admins can insert site content"
    on public.site_content for insert to authenticated
    with check ((select public.is_admin()));

drop policy if exists "admins can update site content" on public.site_content;
create policy "admins can update site content"
    on public.site_content for update to authenticated
    using ((select public.is_admin()))
    with check ((select public.is_admin()));

drop policy if exists "public can read published services" on public.services;
create policy "public can read published services"
    on public.services for select to anon, authenticated
    using (published or (select public.is_admin()));

drop policy if exists "admins can insert services" on public.services;
create policy "admins can insert services"
    on public.services for insert to authenticated
    with check ((select public.is_admin()));

drop policy if exists "admins can update services" on public.services;
create policy "admins can update services"
    on public.services for update to authenticated
    using ((select public.is_admin()))
    with check ((select public.is_admin()));

drop policy if exists "admins can delete services" on public.services;
create policy "admins can delete services"
    on public.services for delete to authenticated
    using ((select public.is_admin()));

drop policy if exists "public can read published projects" on public.projects;
create policy "public can read published projects"
    on public.projects for select to anon, authenticated
    using (published or (select public.is_admin()));

drop policy if exists "admins can insert projects" on public.projects;
create policy "admins can insert projects"
    on public.projects for insert to authenticated
    with check ((select public.is_admin()));

drop policy if exists "admins can update projects" on public.projects;
create policy "admins can update projects"
    on public.projects for update to authenticated
    using ((select public.is_admin()))
    with check ((select public.is_admin()));

drop policy if exists "admins can delete projects" on public.projects;
create policy "admins can delete projects"
    on public.projects for delete to authenticated
    using ((select public.is_admin()));

grant select on public.site_content, public.services, public.projects to anon, authenticated;
grant insert, update on public.site_content to authenticated;
grant insert, update, delete on public.services, public.projects to authenticated;
grant select on public.admin_users to authenticated;

insert into public.site_content (id, content)
values (
    'main',
    '{
        "brand_name": "BrielCode",
        "brand_initial": "B",
        "location": "Valledupar, Colombia",
        "nav_services": "Servicios",
        "nav_projects": "Proyectos",
        "nav_about": "Sobre mí",
        "nav_cta": "Hablemos",
        "page_title": "BrielCode | Desarrollo digital para tu negocio",
        "meta_description": "Desarrollo web, comercio electrónico y automatización para empresas en Colombia.",
        "hero_eyebrow": "DESARROLLO DIGITAL · COLOMBIA",
        "hero_title": "Tu negocio merece",
        "hero_highlight": "crecer sin límites.",
        "hero_description": "Creamos experiencias digitales, tiendas online y automatizaciones que convierten buenas ideas en negocios preparados para crecer.",
        "hero_cta": "Hablemos de tu proyecto",
        "hero_secondary_cta": "Conoce nuestro trabajo",
        "hero_proof": "personas y negocios reales.",
        "trust_1": "DISEÑO CON PROPÓSITO",
        "trust_2": "TECNOLOGÍA ESCALABLE",
        "trust_3": "ACOMPAÑAMIENTO REAL",
        "trust_4": "COLOMBIA",
        "services_eyebrow": "QUÉ HACEMOS",
        "services_title": "Tecnología que trabaja\npara tu negocio.",
        "services_description": "Soluciones digitales pensadas para resolver problemas reales, mejorar procesos y ayudarte a avanzar con confianza.",
        "portfolio_eyebrow": "TRABAJO SELECCIONADO",
        "portfolio_title": "Ideas que ya están\nhaciendo la diferencia.",
        "portfolio_description": "Cada proyecto empieza escuchando. El resultado: herramientas útiles, hechas para durar y crecer junto a quienes las usan.",
        "about_eyebrow": "QUIÉN ESTÁ DETRÁS",
        "about_title": "Construimos con propósito. Crecemos contigo.",
        "about_paragraph_1": "Soy ingeniero de software y me apasiona convertir desafíos cotidianos en soluciones digitales simples, bien diseñadas y confiables.",
        "about_paragraph_2": "BrielCode nace con una visión de legado y compromiso a largo plazo. Cada proyecto lo construyo con dedicación, como si fuera propio.",
        "about_cta": "Cuéntame tu idea",
        "contact_eyebrow": "TU SIGUIENTE PASO",
        "contact_title": "¿Y si hacemos realidad lo que tienes en mente?",
        "contact_description": "Cuéntame qué necesitas. Hablemos de cómo la tecnología puede ayudarte a llegar más lejos.",
        "contact_cta": "Empecemos a conversar",
        "whatsapp_number": "",
        "whatsapp_message": "Hola, quiero hablar sobre un proyecto.",
        "footer_text": "Diseño y desarrollo digital desde Valledupar, Colombia.",
        "profile_image": "",
        "profile_image_path": "",
        "hero_image": "",
        "hero_image_path": ""
    }'::jsonb
)
on conflict (id) do nothing;

insert into public.services (title, description, icon, sort_order)
select seed.title, seed.description, seed.icon, seed.sort_order
from (values
    ('Tiendas online', 'Experiencias de compra rápidas, atractivas y listas para convertir visitas en clientes.', '↗', 1),
    ('Plataformas a medida', 'Aplicaciones web y sistemas diseñados alrededor de la forma en que trabaja tu negocio.', '⌘', 2),
    ('Automatización e IA', 'Conecta tus herramientas y libera tiempo con automatizaciones inteligentes.', '✳', 3)
) as seed(title, description, icon, sort_order)
where not exists (select 1 from public.services);



insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'portafolio',
    'portafolio',
    true,
    8388608,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can view portfolio images" on storage.objects;
create policy "public can view portfolio images"
    on storage.objects for select to anon, authenticated
    using (bucket_id = 'portafolio');

drop policy if exists "admins can upload portfolio images" on storage.objects;
create policy "admins can upload portfolio images"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'portafolio' and (select public.is_admin()));

drop policy if exists "admins can update portfolio images" on storage.objects;
create policy "admins can update portfolio images"
    on storage.objects for update to authenticated
    using (bucket_id = 'portafolio' and (select public.is_admin()))
    with check (bucket_id = 'portafolio' and (select public.is_admin()));

drop policy if exists "admins can delete portfolio images" on storage.objects;
create policy "admins can delete portfolio images"
    on storage.objects for delete to authenticated
    using (bucket_id = 'portafolio' and (select public.is_admin()));

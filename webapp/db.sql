create schema public;

create table "user"
(
	id serial not null,
	token text not null,
	created_on timestamp with time zone default now() not null
);

create unique index user_id_uindex
	on "user" (id);

create unique index user_token_uindex
	on "user" (token);

alter table "user"
	add constraint user_pk
		primary key (id);

create table ip
(
	id serial not null,
	address text not null,
	created_on timestamp with time zone default now() not null
);

create unique index ip_address_uindex
	on ip (address);

create unique index ip_id_uindex
	on ip (id);

alter table ip
	add constraint ip_pk
		primary key (id);

create table session
(
	id serial not null,
	"user" int not null
		constraint session_user_id_fk
			references "user"
				on update cascade on delete restrict,
	ip int not null
		constraint session_ip_id_fk
			references ip
				on update cascade on delete restrict,
	s3_key text not null,
	s3_confirmed_upload boolean default false not null,
	description_user text,
	tab_id int not null,
	start_ts timestamp with time zone not null,
	end_ts timestamp with time zone not null,
	created_on timestamp with time zone default now() not null
);

create unique index session_id_uindex
	on session (id);

create unique index session_s3_key_uindex
	on session (s3_key);

alter table session
	add constraint session_pk
		primary key (id);


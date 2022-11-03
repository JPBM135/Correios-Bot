create table user_config (
	user_id text not null,
	allow_dm boolean not null default true,
	always_restrict boolean not null default false
);

alter table user_config add constraint user_config_pk primary key (user_id);

create table correios_codes (
	code text not null,
	"name" text,
	owner_id text not null,
	channel_id text not null,
	restricted boolean not null default false,
	lastUpdate timestamp not null default current_timestamp,
	events_size int not null default 0,
	ended boolean not null default false
);

alter table correios_codes add constraint correios_codes_pk primary key (code);
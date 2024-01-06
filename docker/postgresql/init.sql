create table user_config (
	user_id text primary key,
	allow_dm boolean not null default true,
	always_restrict boolean not null default false
);

create table correios_codes (
	code varchar(20) primary key,
	name VARCHAR(100) not null,
	owner_id text not null,
	channel_id text not null,
	restricted boolean not null default false,
	last_update timestamp not null default current_timestamp,
	events_size int not null default 0,
	ended boolean not null default false
);

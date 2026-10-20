CREATE EXTENSION IF NOT EXISTS "citext";--> statement-breakpoint
CREATE TYPE "public"."ai_generation_step" AS ENUM('theme', 'template');--> statement-breakpoint
CREATE TYPE "public"."attendance" AS ENUM('hadir', 'akan_hadir', 'tidak_hadir');--> statement-breakpoint
CREATE TYPE "public"."image_role" AS ENUM('cover', 'couple', 'gallery', 'music');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('draft', 'preview', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'failed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TABLE "ai_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"invitation_id" uuid NOT NULL,
	"step" "ai_generation_step" NOT NULL,
	"model" text,
	"status" text DEFAULT 'success' NOT NULL,
	"error" text,
	"tokens_in" integer,
	"tokens_out" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"sent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"url" text NOT NULL,
	"role" "image_role" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"slug" "citext" NOT NULL,
	"status" "invitation_status" DEFAULT 'draft' NOT NULL,
	"html_template" text NOT NULL,
	"vars" jsonb NOT NULL,
	"theme" jsonb NOT NULL,
	"template_version" integer DEFAULT 1 NOT NULL,
	"vars_schema_version" integer DEFAULT 1 NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_vars_object" CHECK (jsonb_typeof("vars") = 'object'),
	CONSTRAINT "invitations_theme_object" CHECK (jsonb_typeof("theme") = 'object'),
	CONSTRAINT "invitations_html_template_length" CHECK (length("html_template") <= 200000)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"invitation_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"midtrans_order_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"name" text NOT NULL,
	"attendance" "attendance" NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_images" ADD CONSTRAINT "invitation_images_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_generations_user_id_idx" ON "ai_generations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_generations_invitation_id_idx" ON "ai_generations" USING btree ("invitation_id");--> statement-breakpoint
CREATE INDEX "guests_invitation_id_idx" ON "guests" USING btree ("invitation_id");--> statement-breakpoint
CREATE INDEX "invitation_images_invitation_id_idx" ON "invitation_images" USING btree ("invitation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_slug_unique" ON "invitations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "invitations_user_id_idx" ON "invitations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_invitation_id_idx" ON "orders" USING btree ("invitation_id");--> statement-breakpoint
CREATE INDEX "rsvps_invitation_id_idx" ON "rsvps" USING btree ("invitation_id");
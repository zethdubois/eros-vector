CREATE TYPE "public"."survey_bank" AS ENUM('quick_vibe', 'deep_dive');--> statement-breakpoint
CREATE TABLE "survey_axes" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"positive_pole" text NOT NULL,
	"negative_pole" text NOT NULL,
	"display_order" integer NOT NULL,
	CONSTRAINT "survey_axes_display_order_unique" UNIQUE("display_order")
);
--> statement-breakpoint
CREATE TABLE "survey_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"bank" "survey_bank" NOT NULL,
	"axis_id" text NOT NULL,
	"text" text NOT NULL,
	"position" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "survey_questions_position_positive" CHECK ("survey_questions"."position" >= 1)
);
--> statement-breakpoint
ALTER TABLE "survey_questions" ADD CONSTRAINT "survey_questions_axis_id_survey_axes_id_fk" FOREIGN KEY ("axis_id") REFERENCES "public"."survey_axes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "survey_questions_bank_axis_position_uidx" ON "survey_questions" USING btree ("bank","axis_id","position");
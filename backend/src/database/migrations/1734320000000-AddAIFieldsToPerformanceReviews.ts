import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAIFieldsToPerformanceReviews1734320000000 implements MigrationInterface {
  name = 'AddAIFieldsToPerformanceReviews1734320000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add AI-specific fields to performance_reviews table
    await queryRunner.addColumns('performance_reviews', [
      new TableColumn({
        name: 'is_ai_generated',
        type: 'boolean',
        default: false,
      }),
      new TableColumn({
        name: 'ai_confidence_score',
        type: 'decimal',
        precision: 3,
        scale: 2,
        isNullable: true,
      }),
      new TableColumn({
        name: 'ai_generated_at',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'ai_sources',
        type: 'jsonb',
        isNullable: true,
      }),
      new TableColumn({
        name: 'human_edited',
        type: 'boolean',
        default: false,
      }),
      new TableColumn({
        name: 'human_edited_at',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'human_edited_by_id',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'strengths',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'areas_for_improvement',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'achievements',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'goals_for_next_period',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'manager_comments',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'employee_comments',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'development_plan',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'organization_id',
        type: 'uuid',
        isNullable: true,
      }),
    ]);

    // Update the status enum to include 'ai_generated'
    await queryRunner.query(`
      ALTER TYPE "performance_reviews_status_enum" 
      ADD VALUE IF NOT EXISTS 'ai_generated'
    `);

    // Add foreign key constraint for human_edited_by_id
    await queryRunner.query(`
      ALTER TABLE "performance_reviews" 
      ADD CONSTRAINT "FK_performance_reviews_human_edited_by" 
      FOREIGN KEY ("human_edited_by_id") 
      REFERENCES "employees"("id") 
      ON DELETE SET NULL
    `);

    // Make reviewer_id nullable (it was required before)
    await queryRunner.query(`
      ALTER TABLE "performance_reviews" 
      ALTER COLUMN "reviewer_id" DROP NOT NULL
    `);

    // Add review_cycle_id column if it doesn't exist
    const table = await queryRunner.getTable('performance_reviews');
    const reviewCycleIdColumn = table?.findColumnByName('review_cycle_id');
    
    if (!reviewCycleIdColumn) {
      await queryRunner.addColumn('performance_reviews', new TableColumn({
        name: 'review_cycle_id',
        type: 'uuid',
        isNullable: false,
      }));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "performance_reviews" 
      DROP CONSTRAINT IF EXISTS "FK_performance_reviews_human_edited_by"
    `);

    // Remove added columns
    await queryRunner.dropColumns('performance_reviews', [
      'is_ai_generated',
      'ai_confidence_score',
      'ai_generated_at',
      'ai_sources',
      'human_edited',
      'human_edited_at',
      'human_edited_by_id',
      'strengths',
      'areas_for_improvement',
      'achievements',
      'goals_for_next_period',
      'manager_comments',
      'employee_comments',
      'development_plan',
      'organization_id',
    ]);

    // Note: We don't remove the 'ai_generated' enum value as it might break existing data
    // In production, you might want to handle this more carefully
  }
} 
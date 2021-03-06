# frozen_string_literal: true

module Mutations
  class GradeNext < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :registration_id, ID, null: false
    field :qnum, Integer, null: false
    field :pnum, Integer, null: false

    def authorized?(exam:, **_args)
      return true if exam.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:)
      GradingLock.transaction do
        lock = my_currently_grading(exam) || next_incomplete(exam)

        raise GraphQL::ExecutionError, 'No submissions need grading.' unless lock

        updated = lock.update(grader: context[:current_user])
        raise GraphQL::ExecutionError, updated.errors.full_messages.to_sentence unless updated

        reg_id = HourglassSchema.id_from_object(lock.registration, Types::RegistrationType, context)
        { registration_id: reg_id, qnum: lock.qnum, pnum: lock.pnum }
      end
    end

    private

    def my_currently_grading(exam)
      exam.grading_locks.where(grader: context[:current_user]).incomplete.first
    end

    def next_incomplete(exam)
      sorted = exam.grading_locks.incomplete.no_grader.sort_by { |l| [l.qnum, l.pnum] }
      sorted.first
    end
  end
end

# frozen_string_literal: true

module Mutations
  class AcquireGradingLock < BaseMutation
    argument :registration_id, ID, required: true, loads: Types::RegistrationType
    argument :qnum, Integer, required: true
    argument :pnum, Integer, required: true

    field :acquired, Boolean, null: false

    def authorized?(registration:, **_args)
      return true if registration.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(registration:, qnum:, pnum:)
      GradingLock.transaction do
        lock = registration.grading_locks.find_or_initialize_by(registration: registration, qnum: qnum, pnum: pnum)
        raise GraphQL::ExecutionError, 'That part is already being graded.' if lock&.grader

        lock.grader = context[:current_user]
        lock.save!
      end
      { acquired: true }
    end
  end
end

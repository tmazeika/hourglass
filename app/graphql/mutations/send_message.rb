# frozen_string_literal: true

module Mutations
  # Mutation to send a message (private, room-wide, version-wide or exam-wide)
  class SendMessage < BaseMutation
    argument :recipient_id, ID, required: true
    argument :message, String, required: true

    def authorized?(recipient_id:, **_args)
      obj = HourglassSchema.object_from_id(recipient_id, context)
      exam = exam_for_obj(obj)
      return true if exam.proctors_and_professors.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(recipient_id:, message:)
      obj = HourglassSchema.object_from_id(recipient_id, context)
      exam = exam_for_obj(obj)
      msg = new_msg_for_obj(obj, context, message)
      saved = msg.save
      raise GraphQL::ExecutionError, exam.errors.full_messages.to_sentence unless saved

      trigger_subscription(exam, msg)
      {}
    end

    private

    def trigger_subscription(exam, message)
      case message
      when Message
        # Tell other profs a message was sent
        HourglassSchema.subscriptions.trigger(
          :message_was_sent,
          { exam_id: HourglassSchema.id_from_object(exam, Types::ExamType, context) },
          message,
        )
        # Tell the student they received a message
        HourglassSchema.subscriptions.trigger(
          :message_received,
          { registration_id: HourglassSchema.id_from_object(message.registration, Types::RegistrationType, context) },
          message,
        )
      when ExamAnnouncement
        HourglassSchema.subscriptions.trigger(
          :exam_announcement_was_sent,
          { exam_id: HourglassSchema.id_from_object(exam, Types::ExamType, context) },
          message,
        )
      when VersionAnnouncement
        # profs
        HourglassSchema.subscriptions.trigger(
          :version_announcement_was_sent,
          { exam_id: HourglassSchema.id_from_object(message.exam_version.exam, Types::ExamType, context) },
          message,
        )
        # students
        HourglassSchema.subscriptions.trigger(
          :version_announcement_received,
          { exam_version_id: HourglassSchema.id_from_object(message.exam_version, Types::ExamVersionType, context) },
          message,
        )
      when RoomAnnouncement
        # profs
        HourglassSchema.subscriptions.trigger(
          :room_announcement_was_sent,
          { exam_id: HourglassSchema.id_from_object(message.room.exam, Types::ExamType, context) },
          message,
        )
        # students
        HourglassSchema.subscriptions.trigger(
          :room_announcement_received,
          { room_id: HourglassSchema.id_from_object(message.room, Types::RoomType, context) },
          message,
        )
      end
    end

    def new_msg_for_obj(obj, context, message)
      case obj
      when Exam
        ExamAnnouncement.new(exam: obj, body: message)
      when ExamVersion
        VersionAnnouncement.new(exam_version: obj, body: message)
      when Room
        RoomAnnouncement.new(room: obj, body: message)
      when Registration
        Message.new(sender: context[:current_user], registration: obj, body: message)
      else
        raise GraphQL::ExecutionError, 'Invalid message recipient.'
      end
    end

    def exam_for_obj(obj)
      case obj
      when Exam
        obj
      when ExamVersion, Room, Registration
        obj.exam
      else
        raise GraphQL::ExecutionError, 'Invalid message recipient.'
      end
    end
  end
end

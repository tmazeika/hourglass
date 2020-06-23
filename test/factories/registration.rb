# frozen_string_literal: true

FactoryBot.define do
  factory :registration do
    transient do
      exam { create(:exam) }
    end

    user
    exam_version { create(:exam_version, exam: exam) }

    trait :in_room do
      room { create(:room, exam: exam) }
    end

    # Student starts at the start of their window
    trait :early_start do
      start_time { accommodated_start_time }
    end

    # Student starts 1/8 of the way into their window
    trait :normal_start do
      start_time { accommodated_start_time + (accommodated_duration / 8.0) }
    end

    # Student starts with 1/4 of their time remaining in their window
    trait :late_start do
      start_time { accommodated_end_time - (accommodated_duration / 4.0) }
    end

    trait :done do
      early_start
      end_time { start_time + effective_duration }
    end
  end
end

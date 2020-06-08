# frozen_string_literal: true

# An announcement sent during an exam to all students taking a particular version.
class VersionAnnouncement < ApplicationRecord
  belongs_to :exam_version

  validates :exam_version, presence: true
  validates :body, presence: true

  def serialize
    # TODO
    {
      body: body,
      time: created_at,
      personal: false
    }
  end
end
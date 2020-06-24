# frozen_string_literal: true

# A course taken by students that gives exams.
class Course < ApplicationRecord
  has_many :exams, dependent: :destroy
  has_many :sections, dependent: :destroy

  has_many :professor_course_registrations, dependent: :destroy
  has_many :staff_registrations, through: :sections
  has_many :student_registrations, through: :sections

  validates :title, presence: true
  validates :bottlenose_id, presence: true

  def students
    student_registrations.select(:user_id).includes(:user).distinct.map(&:user)
  end

  def staff
    staff_registrations.select(:user_id).includes(:user).distinct.map(&:user)
  end

  def professors
    professor_course_registrations.select(:user_id).includes(:user).distinct.map(&:user)
  end

  def has_staff?
    staff_registrations.exists?
  end
end

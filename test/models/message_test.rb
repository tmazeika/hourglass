# frozen_string_literal: true

require 'test_helper'

class MessageTest < ActiveSupport::TestCase
  test 'factory creates valid messages' do
    msg = build(:message)
    assert msg.valid?
    assert msg.save
    assert msg.sender.sent_messages.include? msg
    assert msg.registration.messages.include? msg
  end

  test 'should not save message without sender' do
    msg = build(:message, sender: nil)
    assert_not msg.save
  end

  test 'students cannot send messages to other students' do
    e = build(:exam)
    reg = build(:registration, exam: e)
    reg2 = build(:registration, exam: e)
    msg = build(
      :message,
      {
        sender: reg.user,
        registration: reg2,
        body: 'hi',
      }
    )
    assert_not msg.valid?
    assert_match(/must be a professor/, msg.errors[:sender].first)
    assert_not msg.save
  end
end

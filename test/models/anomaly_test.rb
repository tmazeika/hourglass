# frozen_string_literal: true

require 'test_helper'

class AnomalyTest < ActiveSupport::TestCase
  test 'factory creates valid anomaly' do
    assert build(:anomaly).valid?
  end
end

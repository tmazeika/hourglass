Rails.application.routes.draw do
  namespace :api do
    get :me

    namespace :professor do
      resources :courses, param: 'course_id', only: [:index, :show] do
        member do
          resources :exams, param: 'exam_id', only: [:create, :index]
        end
      end
      # resources :sections, only: [] do
      #   member do
      #     post :sync
      #   end
      # end
    end

    # namespace :proctor do
    #   resources :exams, only: [:create] do
    #     post :finalize
    #   end
    #   resources :rooms, only: [] do
    #     post :finalize
    #   end
    #   resources :registrations, only: [:show] do
    #     post :finalize
    #     resources :anomalies, param: 'anomaly_id', only: [:index, :destroy]
    #   end
    # end

    namespace :student do
      resources :registrations, only: [:index]
      resources :exams, param: 'exam_id', only: [:show] do
        member do
          post :take
        end
      end
    end
  end

  devise_for :users, skip: [:registrations, :passwords], controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks'
  }

  root to: 'main#index'
  get '*path', to: 'main#index'
end

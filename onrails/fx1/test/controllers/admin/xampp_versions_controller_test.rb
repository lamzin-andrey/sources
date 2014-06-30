require 'test_helper'

class Admin::XamppVersionsControllerTest < ActionController::TestCase
  setup do
    @admin_xampp_version = admin_xampp_versions(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:admin_xampp_versions)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create admin_xampp_version" do
    assert_difference('Admin::XamppVersion.count') do
      post :create, admin_xampp_version: {  }
    end

    assert_redirected_to admin_xampp_version_path(assigns(:admin_xampp_version))
  end

  test "should show admin_xampp_version" do
    get :show, id: @admin_xampp_version
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @admin_xampp_version
    assert_response :success
  end

  test "should update admin_xampp_version" do
    patch :update, id: @admin_xampp_version, admin_xampp_version: {  }
    assert_redirected_to admin_xampp_version_path(assigns(:admin_xampp_version))
  end

  test "should destroy admin_xampp_version" do
    assert_difference('Admin::XamppVersion.count', -1) do
      delete :destroy, id: @admin_xampp_version
    end

    assert_redirected_to admin_xampp_versions_path
  end
end

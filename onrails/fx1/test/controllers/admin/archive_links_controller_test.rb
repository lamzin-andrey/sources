require 'test_helper'

class Admin::ArchiveLinksControllerTest < ActionController::TestCase
  setup do
    @admin_archive_link = admin_archive_links(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:admin_archive_links)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create admin_archive_link" do
    assert_difference('Admin::ArchiveLink.count') do
      post :create, admin_archive_link: { bits: @admin_archive_link.bits, link_full: @admin_archive_link.link_full, link_light: @admin_archive_link.link_light }
    end

    assert_redirected_to admin_archive_link_path(assigns(:admin_archive_link))
  end

  test "should show admin_archive_link" do
    get :show, id: @admin_archive_link
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @admin_archive_link
    assert_response :success
  end

  test "should update admin_archive_link" do
    patch :update, id: @admin_archive_link, admin_archive_link: { bits: @admin_archive_link.bits, link_full: @admin_archive_link.link_full, link_light: @admin_archive_link.link_light }
    assert_redirected_to admin_archive_link_path(assigns(:admin_archive_link))
  end

  test "should destroy admin_archive_link" do
    assert_difference('Admin::ArchiveLink.count', -1) do
      delete :destroy, id: @admin_archive_link
    end

    assert_redirected_to admin_archive_links_path
  end
end
